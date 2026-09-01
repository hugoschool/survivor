package models

import "gorm.io/gorm"

type Question struct {
	gorm.Model `json:"-"`
	SurveyID   uint     `json:"survey_id"`
	Question   string   `json:"question"`
	Answers    []Answer `json:"answers"`
}
