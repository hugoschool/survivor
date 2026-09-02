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

func getLatestSurvey(c *gin.Context) (*models.Survey, error) {
	survey, err := database.GetLastSurvey()

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, models.ApiError{Message: "Survey not found"})
		} else {
			c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		}
		return nil, err
	}

	return &survey, nil
}

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
	survey, err := getLatestSurvey(c)

	if err != nil {
		// Context is already handled in getLatestSurvey
		return
	}

	c.JSON(http.StatusOK, survey)
}

// SurveyPost godoc
// @Summary Initialize the first survey
// @Schemes
// @Description Initialize the first survey
// @Tags Survey
// @Accept json
// @Produce json
// @Param request body models.Survey true "Request body"
// @Success 200 {object} models.Survey
// @Failure 400 {object} models.ApiError
// @Failure 404 {object} models.ApiError
// @Failure 500 {object} models.ApiError
// @Router /survey [post]
func SurveyPostHandler(c *gin.Context) {
	var body models.Survey

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, models.ApiError{Message: "Incorrect body"})
		return
	}

	ctx := context.Background()
	_, err := gorm.G[models.Survey](database.DB).Last(ctx)

	if err == nil {
		c.JSON(http.StatusBadRequest, models.ApiError{Message: "Survey already exists, use PUT instead"})
		return
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	ctx = context.Background()
	err = gorm.G[models.Survey](database.DB).Create(ctx, &body)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	c.JSON(http.StatusOK, models.ApiMessage{Message: "Success"})
}

// SurveyPut godoc
// @Summary Modify the survey
// @Schemes
// @Description Modify the survey
// @Tags Survey
// @Accept json
// @Produce json
// @Param request body models.Survey true "Request body"
// @Success 200 {object} models.Survey
// @Failure 400 {object} models.ApiError
// @Failure 404 {object} models.ApiError
// @Failure 500 {object} models.ApiError
// @Router /survey [put]
func SurveyPutHandler(c *gin.Context) {
	var body models.Survey

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, models.ApiError{Message: "Incorrect body"})
		return
	}

	survey, err := getLatestSurvey(c)

	if err != nil {
		return
	}

	ctx := context.Background()

	// Delete all previous questions from the questions table which match the survey ID
	// Save appends the questions to the current state of the survey
	_, err = gorm.G[models.Question](database.DB).Where("survey_id = ?", survey.ID).Delete(ctx)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	body.ID = survey.ID

	err = database.DB.Save(&body).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	c.JSON(http.StatusOK, models.ApiMessage{Message: "Success"})
}
