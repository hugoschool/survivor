package models

import "gorm.io/gorm"

type Location struct {
	gorm.Model
	UserID  uint   `json:"user_id"`
	Content string `json:"content"`
}
