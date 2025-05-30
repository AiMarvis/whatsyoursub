/**
 * Memory Bank Service
 * memory-bank 폴더와 상호작용하는 API를 제공합니다.
 * 구독 데이터 저장, 조회, 업데이트, 삭제 기능을 구현합니다.
 */

import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 기본 경로 설정
const MEMORY_BANK_ROOT = path.join(process.cwd(), 'memory-bank');
const DATA_DIR = path.join(MEMORY_BANK_ROOT, 'data');
const NOTES_DIR = path.join(MEMORY_BANK_ROOT, 'notes');
const CONFIG_DIR = path.join(MEMORY_BANK_ROOT, 'config');
const CACHE_DIR = path.join(MEMORY_BANK_ROOT, 'cache');

/**
 * 파일 시스템 관련 유틸리티 함수
 */
const FileSystem = {
  /**
   * 디렉토리가 존재하는지 확인하고, 존재하지 않으면 생성합니다.
   * @param {string} dirPath - 확인할 디렉토리 경로
   * @returns {Promise<boolean>} - 디렉토리 생성 여부
   */
  async ensureDir(dirPath) {
    try {
      await fs.access(dirPath);
      return true;
    } catch (error) {
      // 디렉토리가 존재하지 않으면 생성
      await fs.mkdir(dirPath, { recursive: true });
      return false;
    }
  },

  /**
   * 파일이 존재하는지 확인합니다.
   * @param {string} filePath - 확인할 파일 경로
   * @returns {Promise<boolean>} - 파일 존재 여부
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * JSON 파일을 읽어서 파싱합니다.
   * @param {string} filePath - JSON 파일 경로
   * @param {any} defaultValue - 파일이 없을 경우 반환할 기본값
   * @returns {Promise<any>} - 파싱된 JSON 데이터
   */
  async readJsonFile(filePath, defaultValue = {}) {
    try {
      const exists = await this.fileExists(filePath);
      if (!exists) return defaultValue;

      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading JSON file ${filePath}:`, error);
      return defaultValue;
    }
  },

  /**
   * 데이터를 JSON 파일로 저장합니다.
   * @param {string} filePath - 저장할 파일 경로
   * @param {any} data - 저장할 데이터
   * @returns {Promise<boolean>} - 저장 성공 여부
   */
  async writeJsonFile(filePath, data) {
    try {
      const dirPath = path.dirname(filePath);
      await this.ensureDir(dirPath);

      const jsonString = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, jsonString, 'utf-8');
      return true;
    } catch (error) {
      console.error(`Error writing JSON file ${filePath}:`, error);
      return false;
    }
  }
};

/**
 * 유효성 검사 및 에러 처리
 */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * 구독 데이터 유효성 검사 함수
 * @param {Object} subscription - 검사할 구독 데이터
 * @throws {ValidationError} - 유효성 검사 실패 시 에러
 */
const validateSubscription = (subscription) => {
  if (!subscription) {
    throw new ValidationError('구독 데이터가 필요합니다.');
  }

  if (!subscription.name) {
    throw new ValidationError('구독 서비스 이름은 필수입니다.');
  }

  if (subscription.price === undefined || subscription.price === null) {
    throw new ValidationError('구독 가격은 필수입니다.');
  }

  if (!subscription.cycle) {
    throw new ValidationError('결제 주기는 필수입니다.');
  }
};

/**
 * 구독 데이터 관리 클래스
 */
class SubscriptionDataManager {
  /**
   * 생성자
   * @param {string} userId - 사용자 ID
   */
  constructor(userId) {
    if (!userId) {
      throw new ValidationError('사용자 ID는 필수입니다.');
    }
    
    this.userId = userId;
    this.userDataDir = path.join(DATA_DIR, userId);
    this.subscriptionsFile = path.join(this.userDataDir, 'subscriptions.json');
  }

  /**
   * 사용자 데이터 디렉토리 초기화
   * @returns {Promise<void>}
   */
  async init() {
    await FileSystem.ensureDir(this.userDataDir);
    
    // 구독 파일이 없으면 기본 구조로 생성
    const exists = await FileSystem.fileExists(this.subscriptionsFile);
    if (!exists) {
      const defaultData = {
        subscriptions: [],
        metadata: {
          version: '1.0.0',
          lastSync: new Date().toISOString(),
          created: new Date().toISOString()
        }
      };
      
      await FileSystem.writeJsonFile(this.subscriptionsFile, defaultData);
    }
  }

  /**
   * 모든 구독 데이터 조회
   * @returns {Promise<Object>} - 구독 데이터
   */
  async getAllSubscriptions() {
    await this.init();
    return await FileSystem.readJsonFile(this.subscriptionsFile, { subscriptions: [], metadata: {} });
  }

  /**
   * 특정 구독 조회
   * @param {string} subscriptionId - 조회할 구독 ID
   * @returns {Promise<Object|null>} - 구독 데이터 또는 null
   */
  async getSubscription(subscriptionId) {
    if (!subscriptionId) {
      throw new ValidationError('구독 ID는 필수입니다.');
    }
    
    const data = await this.getAllSubscriptions();
    return data.subscriptions.find(sub => sub.id === subscriptionId) || null;
  }

  /**
   * 구독 추가
   * @param {Object} subscription - 추가할 구독 데이터
   * @returns {Promise<Object>} - 추가된 구독 데이터
   */
  async addSubscription(subscription) {
    validateSubscription(subscription);
    
    const data = await this.getAllSubscriptions();
    
    // ID가 없으면 생성
    if (!subscription.id) {
      subscription.id = uuidv4();
    }
    
    // 생성 일시와 업데이트 일시 추가
    const now = new Date().toISOString();
    subscription.createdAt = now;
    subscription.lastUpdated = now;
    
    // 구독 추가
    data.subscriptions.push(subscription);
    
    // 메타데이터 업데이트
    data.metadata.lastSync = now;
    data.metadata.count = data.subscriptions.length;
    
    // 저장
    await FileSystem.writeJsonFile(this.subscriptionsFile, data);
    
    return subscription;
  }

  /**
   * 구독 업데이트
   * @param {string} subscriptionId - 업데이트할 구독 ID
   * @param {Object} updates - 업데이트할 내용
   * @returns {Promise<Object|null>} - 업데이트된 구독 또는 null
   */
  async updateSubscription(subscriptionId, updates) {
    if (!subscriptionId) {
      throw new ValidationError('구독 ID는 필수입니다.');
    }
    
    const data = await this.getAllSubscriptions();
    const index = data.subscriptions.findIndex(sub => sub.id === subscriptionId);
    
    if (index === -1) {
      return null;
    }
    
    // 기존 구독과 업데이트 병합
    const updatedSubscription = {
      ...data.subscriptions[index],
      ...updates,
      id: subscriptionId, // ID는 변경 불가
      lastUpdated: new Date().toISOString()
    };
    
    // 유효성 검사
    validateSubscription(updatedSubscription);
    
    // 업데이트
    data.subscriptions[index] = updatedSubscription;
    data.metadata.lastSync = new Date().toISOString();
    
    // 저장
    await FileSystem.writeJsonFile(this.subscriptionsFile, data);
    
    return updatedSubscription;
  }

  /**
   * 구독 삭제
   * @param {string} subscriptionId - 삭제할 구독 ID
   * @returns {Promise<boolean>} - 삭제 성공 여부
   */
  async deleteSubscription(subscriptionId) {
    if (!subscriptionId) {
      throw new ValidationError('구독 ID는 필수입니다.');
    }
    
    const data = await this.getAllSubscriptions();
    const originalLength = data.subscriptions.length;
    
    // 삭제할 구독 필터링
    data.subscriptions = data.subscriptions.filter(sub => sub.id !== subscriptionId);
    
    // 변경사항이 없으면 false 반환
    if (data.subscriptions.length === originalLength) {
      return false;
    }
    
    // 메타데이터 업데이트
    data.metadata.lastSync = new Date().toISOString();
    data.metadata.count = data.subscriptions.length;
    
    // 저장
    await FileSystem.writeJsonFile(this.subscriptionsFile, data);
    
    return true;
  }

  /**
   * 모든 구독 삭제
   * @returns {Promise<boolean>} - 삭제 성공 여부
   */
  async deleteAllSubscriptions() {
    const data = await this.getAllSubscriptions();
    
    // 구독 초기화
    data.subscriptions = [];
    data.metadata.lastSync = new Date().toISOString();
    data.metadata.count = 0;
    
    // 저장
    await FileSystem.writeJsonFile(this.subscriptionsFile, data);
    
    return true;
  }

  /**
   * 구독 데이터 백업 생성
   * @returns {Promise<Object>} - 백업 데이터
   */
  async createBackup() {
    const data = await this.getAllSubscriptions();
    
    // 백업 메타데이터 추가
    const backupData = {
      ...data,
      backup: {
        timestamp: new Date().toISOString(),
        userId: this.userId,
        version: '1.0.0'
      }
    };
    
    // 백업 디렉토리 생성
    const backupsDir = path.join(this.userDataDir, 'backups');
    await FileSystem.ensureDir(backupsDir);
    
    // 백업 파일명 생성 (타임스탬프 포함)
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
    const backupFilePath = path.join(backupsDir, `subscriptions-backup-${timestamp}.json`);
    
    // 백업 저장
    await FileSystem.writeJsonFile(backupFilePath, backupData);
    
    return {
      path: backupFilePath,
      timestamp: backupData.backup.timestamp,
      subscriptionCount: data.subscriptions.length
    };
  }

  /**
   * 백업 목록 조회
   * @returns {Promise<Array>} - 백업 목록
   */
  async listBackups() {
    const backupsDir = path.join(this.userDataDir, 'backups');
    await FileSystem.ensureDir(backupsDir);
    
    try {
      // 백업 디렉토리의 모든 파일 조회
      const files = await fs.readdir(backupsDir);
      
      // JSON 파일만 필터링
      const backupFiles = files.filter(file => file.endsWith('.json'));
      
      // 각 백업 파일의 기본 정보 추출
      const backups = await Promise.all(
        backupFiles.map(async (file) => {
          const filePath = path.join(backupsDir, file);
          try {
            const stats = await fs.stat(filePath);
            const data = await FileSystem.readJsonFile(filePath);
            
            return {
              filename: file,
              path: filePath,
              timestamp: data.backup?.timestamp || stats.mtime.toISOString(),
              subscriptionCount: data.subscriptions?.length || 0,
              size: stats.size
            };
          } catch (error) {
            console.error(`Error processing backup file ${file}:`, error);
            return null;
          }
        })
      );
      
      // null 값 필터링 및 타임스탬프 기준 내림차순 정렬
      return backups
        .filter(backup => backup !== null)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  }

  /**
   * 백업 복원
   * @param {string} backupFilePath - 복원할 백업 파일 경로
   * @returns {Promise<Object>} - 복원 결과
   */
  async restoreFromBackup(backupFilePath) {
    if (!backupFilePath) {
      throw new ValidationError('백업 파일 경로는 필수입니다.');
    }
    
    try {
      // 백업 파일 존재 확인
      const exists = await FileSystem.fileExists(backupFilePath);
      if (!exists) {
        throw new ValidationError('백업 파일을 찾을 수 없습니다.');
      }
      
      // 백업 파일 읽기
      const backupData = await FileSystem.readJsonFile(backupFilePath);
      
      // 백업 데이터 유효성 검사
      if (!backupData.subscriptions || !Array.isArray(backupData.subscriptions)) {
        throw new ValidationError('잘못된 백업 파일 형식입니다.');
      }
      
      // 현재 데이터 백업 생성 (복원 전 안전 조치)
      await this.createBackup();
      
      // 백업에서 복원할 데이터 생성
      const restoredData = {
        subscriptions: backupData.subscriptions,
        metadata: {
          ...backupData.metadata,
          lastSync: new Date().toISOString(),
          restoredFrom: backupData.backup?.timestamp || 'unknown'
        }
      };
      
      // 복원
      await FileSystem.writeJsonFile(this.subscriptionsFile, restoredData);
      
      return {
        success: true,
        timestamp: new Date().toISOString(),
        subscriptionCount: restoredData.subscriptions.length,
        source: backupFilePath
      };
    } catch (error) {
      console.error('Error restoring from backup:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error(`백업 복원 중 오류가 발생했습니다: ${error.message}`);
    }
  }
}

/**
 * 클라이언트에서 사용할 수 있는 메모리 뱅크 서비스
 * @param {string} userId - 사용자 ID
 * @returns {Object} - 메모리 뱅크 서비스 API
 */
export function createMemoryBankService(userId) {
  if (!userId) {
    throw new ValidationError('사용자 ID는 필수입니다.');
  }
  
  const subscriptionManager = new SubscriptionDataManager(userId);
  
  return {
    // 구독 데이터 관리 API
    subscriptions: {
      getAll: () => subscriptionManager.getAllSubscriptions(),
      get: (id) => subscriptionManager.getSubscription(id),
      add: (subscription) => subscriptionManager.addSubscription(subscription),
      update: (id, updates) => subscriptionManager.updateSubscription(id, updates),
      delete: (id) => subscriptionManager.deleteSubscription(id),
      deleteAll: () => subscriptionManager.deleteAllSubscriptions()
    },
    
    // 백업 및 복원 API
    backup: {
      create: () => subscriptionManager.createBackup(),
      list: () => subscriptionManager.listBackups(),
      restore: (backupPath) => subscriptionManager.restoreFromBackup(backupPath)
    },
    
    // 유틸리티
    utils: {
      validateSubscription
    }
  };
}

/**
 * 파일 시스템 유틸리티 내보내기 (테스트 목적)
 */
export const utils = {
  FileSystem
};

/**
 * 에러 클래스 내보내기
 */
export { ValidationError }; 