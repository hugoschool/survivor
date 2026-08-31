package models

import "gorm.io/gorm"

type Video struct {
	gorm.Model
	UserID uint
	Link   string
}
