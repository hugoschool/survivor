package models

import "gorm.io/gorm"

type Skill struct {
	gorm.Model
	Content string
}
