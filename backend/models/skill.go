package models

import "gorm.io/gorm"

type Skill struct {
	gorm.Model
	UserID  uint   `json:"user_id"`
	Content string `json:"content"`
}
