package models

import "gorm.io/gorm"

type Answer struct {
	gorm.Model
	QuestionID uint
	Answer     string
	Correct    bool
}
