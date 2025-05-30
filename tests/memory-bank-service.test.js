/**
 * memory-bank-service.js 테스트
 */

import { createMemoryBankService, ValidationError } from '../lib/memory-bank-service';
import fs from 'fs/promises';
import path from 'path';

// 테스트를 위한 임시 사용자 ID
const TEST_USER_ID = 'test-user-1';

// 테스트 구독 데이터
const testSubscription = {
  name: '테스트 AI 서비스',
  price: 10000,
  cycle: 'monthly',
  startDate: '2023-01-01',
  category: 'ai-writing',
  tags: ['test', 'ai']
};

// 테스트 데이터 초기화 및 정리 함수
async function cleanupTestData() {
  try {
    const dataDir = path.join(process.cwd(), 'memory-bank', 'data', TEST_USER_ID);
    await fs.rm(dataDir, { recursive: true, force: true });
    console.log('테스트 데이터 정리 완료');
  } catch (error) {
    // 파일이 없는 경우 무시
    if (error.code !== 'ENOENT') {
      console.error('테스트 데이터 정리 중 오류:', error);
    }
  }
}

// 테스트 실행 함수
async function runTests() {
  console.log('Memory Bank Service 테스트 시작');
  
  // 테스트 전 정리
  await cleanupTestData();
  
  try {
    // 서비스 인스턴스 생성
    const memoryBankService = createMemoryBankService(TEST_USER_ID);
    
    // 테스트 1: 초기 상태 확인
    console.log('\n테스트 1: 초기 상태 확인');
    const initialData = await memoryBankService.subscriptions.getAll();
    console.log('초기 데이터:', JSON.stringify(initialData, null, 2));
    console.assert(initialData.subscriptions.length === 0, '초기 구독 목록이 비어있어야 함');
    
    // 테스트 2: 구독 추가
    console.log('\n테스트 2: 구독 추가');
    const addedSubscription = await memoryBankService.subscriptions.add(testSubscription);
    console.log('추가된 구독:', JSON.stringify(addedSubscription, null, 2));
    console.assert(addedSubscription.id, '추가된 구독에 ID가 생성되어야 함');
    console.assert(addedSubscription.name === testSubscription.name, '추가된 구독의 이름이 일치해야 함');
    
    // 테스트 3: 구독 조회
    console.log('\n테스트 3: 구독 조회');
    const subscriptionId = addedSubscription.id;
    const retrievedSubscription = await memoryBankService.subscriptions.get(subscriptionId);
    console.log('조회된 구독:', JSON.stringify(retrievedSubscription, null, 2));
    console.assert(retrievedSubscription.id === subscriptionId, '조회된 구독의 ID가 일치해야 함');
    
    // 테스트 4: 구독 업데이트
    console.log('\n테스트 4: 구독 업데이트');
    const updates = { price: 15000, tags: ['test', 'ai', 'updated'] };
    const updatedSubscription = await memoryBankService.subscriptions.update(subscriptionId, updates);
    console.log('업데이트된 구독:', JSON.stringify(updatedSubscription, null, 2));
    console.assert(updatedSubscription.price === 15000, '업데이트된 구독의 가격이 변경되어야 함');
    console.assert(updatedSubscription.tags.length === 3, '업데이트된 구독의 태그가 변경되어야 함');
    
    // 테스트 5: 백업 생성
    console.log('\n테스트 5: 백업 생성');
    const backup = await memoryBankService.backup.create();
    console.log('생성된 백업:', JSON.stringify(backup, null, 2));
    console.assert(backup.subscriptionCount === 1, '백업의 구독 수가 일치해야 함');
    
    // 테스트 6: 백업 목록 조회
    console.log('\n테스트 6: 백업 목록 조회');
    const backups = await memoryBankService.backup.list();
    console.log('백업 목록:', JSON.stringify(backups, null, 2));
    console.assert(backups.length > 0, '백업 목록이 존재해야 함');
    
    // 테스트 7: 구독 삭제
    console.log('\n테스트 7: 구독 삭제');
    const deleteResult = await memoryBankService.subscriptions.delete(subscriptionId);
    console.log('삭제 결과:', deleteResult);
    console.assert(deleteResult === true, '구독 삭제가 성공해야 함');
    
    // 테스트 8: 삭제 후 구독 목록 확인
    console.log('\n테스트 8: 삭제 후 구독 목록 확인');
    const dataAfterDelete = await memoryBankService.subscriptions.getAll();
    console.log('삭제 후 데이터:', JSON.stringify(dataAfterDelete, null, 2));
    console.assert(dataAfterDelete.subscriptions.length === 0, '삭제 후 구독 목록이 비어있어야 함');
    
    // 테스트 9: 백업 복원
    console.log('\n테스트 9: 백업 복원');
    if (backups.length > 0) {
      const restoreResult = await memoryBankService.backup.restore(backups[0].path);
      console.log('복원 결과:', JSON.stringify(restoreResult, null, 2));
      console.assert(restoreResult.success === true, '백업 복원이 성공해야 함');
      
      const dataAfterRestore = await memoryBankService.subscriptions.getAll();
      console.log('복원 후 데이터:', JSON.stringify(dataAfterRestore, null, 2));
      console.assert(dataAfterRestore.subscriptions.length === 1, '복원 후 구독 목록에 항목이 있어야 함');
    } else {
      console.log('백업이 없어 복원 테스트를 건너뜁니다.');
    }
    
    console.log('\n모든 테스트 성공!');
  } catch (error) {
    console.error('테스트 실패:', error);
  } finally {
    // 테스트 후 정리
    await cleanupTestData();
  }
}

// 테스트 실행
runTests().catch(console.error); 