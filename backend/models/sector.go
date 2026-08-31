package models

import "gorm.io/gorm"

type Sector struct {
	gorm.Model
	UserID  uint
	Content string
}
