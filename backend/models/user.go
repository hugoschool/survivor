package models

import (
	"errors"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var (
	RoleJobSeeker uint = 0
	RoleRecruiter uint = 1
	RoleAdmin     uint = 2

	ErrUserNotInGin = errors.New("user not found in context")
)

type User struct {
	gorm.Model
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Role      uint `json:"role"`
	Age       uint   `json:"age"`
	Views     uint   `json:"views"`

	// Percentage, out of a hundred
	SurveyScore *uint

	Login Login

	Skills    []Skill
	Locations []Location
	Sectors   []Sector
	Videos    []Video
}

func GetUserFromContext(c *gin.Context) (User, error) {
	userAny, ok := c.Get("user")

	if !ok {
		return User{}, ErrUserNotInGin
	}

	user, ok := userAny.(User)

	if !ok {
		return User{}, ErrUserNotInGin
	}

	return user, nil
}
