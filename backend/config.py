from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://aim_user:aim_pass@localhost:5432/aim_db"
    test_database_url: str = "postgresql+asyncpg://aim_user:aim_pass@localhost:5432/aim_test_db"


settings = Settings()
