package routes

import (
	"context"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hugoarnal/survivor/database"
	"github.com/hugoarnal/survivor/models"
	"gorm.io/gorm"
)

// SurveyGet godoc
// @Summary Get the full survey
// @Schemes
// @Description Get the full survey
// @Tags Survey
// @Accept json
// @Produce json
// @Success 200 {object} models.Survey
// @Failure 400 {object} models.ApiError
// @Failure 404 {object} models.ApiError
// @Failure 500 {object} models.ApiError
// @Router /survey [get]
func SurveyGetHandler(c *gin.Context) {
	ctx := context.Background()
	survey, err := gorm.G[models.Survey](database.DB).Last(ctx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, models.ApiError{Message: "Survey not found"})
			return
		} else {
			c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
			return
		}
	}

	c.JSON(http.StatusOK, survey)
}
