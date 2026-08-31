package routes

import (
	"context"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hugoarnal/survivor/database"
	"github.com/hugoarnal/survivor/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type registerBody struct {
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Role      uint   `json:"role" binding:"required"`
	Age       uint   `json:"age" binding:"required"`
	Mail      string `json:"mail" binding:"required"`
	Password  string `json:"password" binding:"required"`
}

func LoginHandler(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "pong",
	})
}

func RegisterHandler(c *gin.Context) {
	var body registerBody

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Incorrect body",
		})
		return
	}

	if body.Role != models.RoleJobSeeker && body.Role != models.RoleRecruiter {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Incorrect role",
		})
		return
	}

	var err error

	ctx := context.Background()
	_, err = gorm.G[models.Login](database.DB).Where("mail = ?", body.Mail).First(ctx)

	if err == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "User already exists",
		})
		return
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, nil)
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		if errors.Is(err, bcrypt.ErrPasswordTooLong) {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Given password is too long",
			})
			return
		} else {
			c.JSON(http.StatusInternalServerError, nil)
			return
		}
	}

	login := models.Login{
		Mail:     body.Mail,
		Password: string(hash),
	}

	user := models.User{
		FirstName: body.FirstName,
		Lastname:  body.LastName,
		Role:      body.Role,
		Age:       body.Age,
		Views:     0,
		Login:     login,
		Skills:    nil,
		Locations: nil,
		Sectors:   nil,
		Videos:    nil,
	}

	ctx = context.Background()
	err = gorm.G[models.User](database.DB).Create(ctx, &user)

	if err != nil {
		c.JSON(http.StatusInternalServerError, nil)
		return
	}

	c.JSON(200, gin.H{
		"message": "Success",
	})
}
