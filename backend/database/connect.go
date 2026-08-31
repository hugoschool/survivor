package database

import (
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

//nolint:unused
var DB *gorm.DB

func Connect() {
	db_url := os.Getenv("DB_URL")
	if db_url == "" {
		panic("No DB_URL environment variable has been provided")
	}

	var err error
	DB, err = gorm.Open(postgres.Open(db_url), &gorm.Config{})

	if err != nil {
		panic(err)
	}
}
