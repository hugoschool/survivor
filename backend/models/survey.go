package models

import "gorm.io/gorm"

type Survey struct {
	gorm.Model
	ObtentionRate uint
	Questions     []Question
}
