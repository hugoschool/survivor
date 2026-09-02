package routes

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"reflect"
	"slices"

	"github.com/gin-gonic/gin"
	"github.com/hugoarnal/survivor/database"
	"github.com/hugoarnal/survivor/models"
	"gorm.io/gorm"
)

type userSubmitAnswer struct {
	ID      uint `json:"id" binding:"required"`
	Checked bool `json:"checked" binding:"required"`
}

type userSubmitQuestion struct {
	Answers []userSubmitAnswer `json:"answers" binding:"required"`
	ID      uint               `json:"id" binding:"required"`
}

type userSubmitBody struct {
	Questions []userSubmitQuestion `json:"questions" binding:"required"`
}

type userSubmitResponse struct {
	Percentage int `json:"percentage"`
}

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

func getSurveyQuestionIds(survey *models.Survey) []uint {
	questionIds := make([]uint, len(survey.Questions))

	for _, question := range survey.Questions {
		questionIds = append(questionIds, question.ID)
	}

	return questionIds
}

func getUserQuestionIds(body *userSubmitBody) []uint {
	userQuestionIds := make([]uint, len(body.Questions))

	for _, question := range body.Questions {
		userQuestionIds = append(userQuestionIds, question.ID)
	}

	return userQuestionIds
}

// Checks if there is the right amount of questions & if they are matching the current survey
func compareQuestions(survey *models.Survey, body *userSubmitBody) bool {
	questionIds := getSurveyQuestionIds(survey)
	userQuestionIds := getUserQuestionIds(body)

	// Sort both arrays before compare
	slices.Sort(questionIds)
	slices.Sort(userQuestionIds)

	return reflect.DeepEqual(questionIds, userQuestionIds)
}

func getSurveyCorrectAnswers(survey *models.Survey) map[uint][]uint {
	answerMap := make(map[uint][]uint, len(survey.Questions))

	for _, question := range survey.Questions {
		answerMap[question.ID] = make([]uint, 0)

		for _, answer := range question.Answers {
			if answer.Correct {
				answerMap[question.ID] = append(answerMap[question.ID], answer.ID)
			}
		}

		slices.Sort(answerMap[question.ID])
	}

	return answerMap
}

func getUserCorrectAnswers(user *userSubmitBody) map[uint][]uint {
	answerMap := make(map[uint][]uint, len(user.Questions))

	for _, question := range user.Questions {
		answerMap[question.ID] = make([]uint, 0)

		for _, answer := range question.Answers {
			if answer.Checked {
				answerMap[question.ID] = append(answerMap[question.ID], answer.ID)
			}
		}

		slices.Sort(answerMap[question.ID])
	}

	return answerMap
}

// SurveySubmit godoc
// @Summary User submitted answers to the survey
// @Schemes
// @Description User submitted answers to the survey, used to calculate the score
// @Tags Survey
// @Accept json
// @Produce json
// @Param request body userSubmitBody true "Request body"
// @Success 200 {object} userSubmitResponse
// @Failure 400 {object} models.ApiError
// @Failure 404 {object} models.ApiError
// @Failure 500 {object} models.ApiError
// @Router /survey/submit [post]
func SurveySubmitHandler(c *gin.Context) {
	user, err := models.GetUserFromContext(c)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	if user.SurveyScore != nil {
		c.JSON(http.StatusBadRequest, models.ApiError{Message: "You have already completed the survey"})
		return
	}

	var body userSubmitBody

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, models.ApiError{Message: "Incorrect body"})
		return
	}

	survey, err := getLatestSurvey(c)

	if err != nil {
		return
	}

	if !compareQuestions(survey, &body) {
		c.JSON(http.StatusBadRequest, models.ApiError{Message: "User hasn't completed all questions or invalid survey"})
		return
	}

	surveyAnswerMap := getSurveyCorrectAnswers(survey)
	userAnswerMap := getUserCorrectAnswers(&body)

	fmt.Println(surveyAnswerMap)
	fmt.Println(userAnswerMap)

	questionIds := getSurveyQuestionIds(survey)
	answeredCorrectlyIds := make([]uint, 0)

	for _, questionId := range questionIds {
		// If the candidate doesn't have the exact same answers as expected, they fail and don't get the point
		if reflect.DeepEqual(surveyAnswerMap[questionId], userAnswerMap[questionId]) {
			answeredCorrectlyIds = append(answeredCorrectlyIds, questionId)
		}
	}

	percentage := 100 * len(answeredCorrectlyIds) / len(questionIds)

	ctx := context.Background()
	_, err = gorm.G[models.User](database.DB).Where("id = ?", user.ID).Update(ctx, "survey_score", percentage)

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	c.JSON(http.StatusOK, userSubmitResponse{Percentage: percentage})
}
