package models

import "gorm.io/gorm"

type Answer struct {
	gorm.Model
	Answer []string
}
