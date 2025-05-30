# 구독 데이터 저장소

이 폴더는 WhatsYourSub 애플리케이션의 구독 데이터를 저장하는 공간입니다.

## 구조

- 사용자별로 `/{userId}/subscriptions.json` 파일에 구독 정보가 저장됩니다.
- 백업 파일은 `/{userId}/backups/` 폴더에 저장됩니다.

## 데이터 형식

구독 데이터는 다음과 같은 구조로 저장됩니다:

```json
{
  "subscriptions": [
    {
      "id": "unique-id",
      "name": "서비스명",
      "price": 10000,
      "cycle": "monthly",
      "startDate": "2023-01-01",
      "category": "ai-writing",
      "tags": ["writing", "productivity"],
      "lastUpdated": "2023-05-30T12:00:00Z"
    }
  ],
  "metadata": {
    "version": "1.0.0",
    "lastSync": "2023-05-30T12:00:00Z"
  }
}
```

## 주의사항

- 이 폴더의 파일은 직접 수정하지 마세요. memory-bank-service API를 통해 접근하세요.
- 중요한 데이터는 정기적으로 백업하는 것을 권장합니다. 