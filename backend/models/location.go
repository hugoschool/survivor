package models

import "gorm.io/gorm"

type Location struct {
	gorm.Model
	UserID  uint
	Content string `json:"content"`
}
