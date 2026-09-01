package database

import (
	"github.com/hugoarnal/survivor/models"
)

func GetUserById(userId uint) (models.User, error) {
	var user models.User

	tx := DB.Model(&user).
		Preload("Login").
		Preload("Skills").
		Preload("Locations").
		Preload("Sectors").
		Preload("Videos").
		First(&user)
	return user, tx.Error
}
