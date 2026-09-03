package routes

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/hugoarnal/survivor/database"
	"github.com/hugoarnal/survivor/models"
	"gorm.io/gorm"
)

const (
	UsersPageSize int = 20
)

var (
	ErrSkillNotFound    = errors.New("skill not found")
	ErrLocationNotFound = errors.New("location not found")
	ErrSectorNotFound   = errors.New("sector not found")
	ErrVideoNotFound    = errors.New("video not found")
)

// UserGetId godoc
// @Summary Get a singular user
// @Schemes
// @Description Get a singular user
// @Tags Users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} models.User
// @Failure 400 {object} models.ApiError
// @Failure 401 {object} models.ApiError
// @Failure 404 {object} models.ApiError
// @Failure 500 {object} models.ApiError
// @Router /users/:id [get]
func UserGetHandler(c *gin.Context) {
	id := c.Param("id")
	var user models.User

	result := database.DB.Preload("Skills").
		Preload("Locations").
		Preload("Sectors").
		Preload("Videos").
		First(&user, id)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, models.ApiError{Message: "User not found"})
			return
		} else {
			c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
			return
		}
	}

	c.JSON(http.StatusOK, user)
}

// UserGetCurrent godoc
// @Summary Get the current user's details
// @Schemes
// @Description Get the current user's details
// @Tags Users
// @Accept json
// @Produce json
// @Success 200 {object} models.User
// @Failure 400 {object} models.ApiError
// @Failure 401 {object} models.ApiError
// @Failure 404 {object} models.ApiError
// @Failure 500 {object} models.ApiError
// @Router /users/me [get]
func UserGetCurrentHandler(c *gin.Context) {
	user, err := models.GetUserFromContext(c)

	if err != nil {
		c.JSON(http.StatusNotFound, models.ApiError{Message: "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func Paginate(page int) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if page <= 0 {
			page = 1
		}
		offset := (page - 1) * UsersPageSize
		return db.Offset(offset).Limit(UsersPageSize)
	}
}

// UsersGet godoc
// @Summary Get all users (paginated)
// @Schemes
// @Description Get all users (paginated)
// @Tags Users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param page query int true "Page"
// @Success 200 {object} []models.User
// @Failure 401 {object} models.ApiError
// @Failure 500 {object} models.ApiError
// @Router /users [get]
func UsersPaginatedHandler(c *gin.Context) {
	var users []models.User
	page, _ := strconv.Atoi(c.Query("page"))

	err := database.DB.Scopes(Paginate(page)).Preload("Skills").
		Preload("Locations").
		Preload("Sectors").
		Preload("Videos").Find(&users).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}
	c.JSON(http.StatusOK, users)
}

// UserUpdateId godoc
// @Summary Update a singular user
// @Schemes
// @Description Update a singular user
// @Tags Users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param request body models.UserUpdateForm true "Request body"
// @Failure 501 {object} models.ApiError
// @Router /users/:id [put]
func UserUpdateHandler(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, models.ApiError{Message: "Not available yet"})
}

// UserDeleteId godoc
// @Summary Delete a singular user
// @Schemes
// @Description Delete a singular user
// @Tags Users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} models.ApiMessage
// @Failure 400 {object} models.ApiError
// @Failure 401 {object} models.ApiError
// @Failure 404 {object} models.ApiError
// @Failure 500 {object} models.ApiError
// @Router /users/:id [delete]
func UserDeleteHandler(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 0)

	if err != nil {
		c.JSON(http.StatusBadRequest, models.ApiError{Message: "Bad request"})
		return
	}

	user, err := database.GetUserById(uint(id))

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, models.ApiError{Message: "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	err = database.DB.Delete(&user).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}
	c.JSON(http.StatusOK, models.ApiMessage{Message: "Success"})
}
