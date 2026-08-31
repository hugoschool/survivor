package models

import "gorm.io/gorm"

type Skill struct {
	gorm.Model
	UserID  uint
	Content string
}
