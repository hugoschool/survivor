package models

import "gorm.io/gorm"

type Question struct {
	gorm.Model
	Quest   string //trier par ordre croissant comme les answers donc pas besoin d'id de lien
	Answers []Answer
}
