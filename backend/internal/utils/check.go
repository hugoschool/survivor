package utils

import (
	"github.com/hugoschool/survivor/models"
)

func CheckIdAdminOrSelf(user models.User, id uint) bool {
	return user.Role == models.RoleAdmin || user.ID == id
}
