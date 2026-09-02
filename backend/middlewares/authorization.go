package middlewares

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/hugoarnal/survivor/database"
	"github.com/hugoarnal/survivor/models"
)

func AuthMiddleware(c *gin.Context) {
	authorization := c.GetHeader("Authorization")

	if authorization == "" {
		c.JSON(http.StatusUnauthorized, models.ApiError{Message: "Missing authorization header"})
		c.Abort()
		return
	}

	tokens := strings.Split(authorization, " ")

	if len(tokens) != 2 || tokens[0] != "Bearer" {
		c.JSON(http.StatusUnauthorized, models.ApiError{Message: "Incorrect authorization header"})
		c.Abort()
		return
	}

	token, err := jwt.Parse(tokens[1], func(token *jwt.Token) (any, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			c.JSON(http.StatusUnauthorized, models.ApiMessage{Message: "Token expired"})
		} else {
			fmt.Println(err.Error())
			c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		}
		c.Abort()
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)

	if !ok {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		c.Abort()
		return
	}

	if float64(time.Now().Unix()) > claims["exp"].(float64) {
		c.JSON(http.StatusUnauthorized, models.ApiMessage{Message: "Token expired"})
		c.Abort()
		return
	}

	userId := uint(claims["userId"].(float64))
	user, err := database.GetUserById(userId)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		c.Abort()
		return
	}

	c.Set("user", user)

	c.Next()
}

func AdminMiddleware(c *gin.Context) {
	user, err := models.GetUserFromContext(c)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		c.Abort()
		return
	}

	if user.Role != models.RoleAdmin {
		c.JSON(http.StatusUnauthorized, models.ApiError{Message: "You aren't authorized to make this call"})
		c.Abort()
		return
	}

	c.Next()
}
