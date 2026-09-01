package models

import "gorm.io/gorm"

type Question struct {
	gorm.Model
	SurveyID uint
	Question string
	Answers  []Answer
}
