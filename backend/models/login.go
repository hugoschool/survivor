package models

import "gorm.io/gorm"

type Login struct {
	gorm.Model `json:"-"`
	Mail       string `json:"mail"`
	Password   string `json:"password"`
	UserID     uint   `json:"-"`
}
