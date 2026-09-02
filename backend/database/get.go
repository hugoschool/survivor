package database

import (
	"github.com/hugoarnal/survivor/models"
	"gorm.io/gorm"
)

func GetUserTX() *gorm.DB {
	var user models.User

	return DB.Model(&user).
		Preload("Login").
		Preload("Skills").
		Preload("Locations").
		Preload("Sectors").
		Preload("Videos")
}

func GetUserById(userId uint) (models.User, error) {
	var user models.User

	tx := GetUserTX().Where("id = ?", userId).First(&user)
	return user, tx.Error
}

func GetLastSurvey() (models.Survey, error) {
	var survey models.Survey

	tx := DB.Model(&survey).
		Preload("Questions").
		Preload("Questions.Answers").
		Last(&survey)
	return survey, tx.Error
}
