package models

import "gorm.io/gorm"

type Question struct {
	gorm.Model
	SurveyID uint
	Question string `json:"question"`
	Weight uint `json:"weight"`
	Answers  []Answer
}
