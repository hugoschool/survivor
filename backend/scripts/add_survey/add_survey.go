package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/hugoschool/survivor/database"
	"github.com/hugoschool/survivor/models"
	"gorm.io/gorm"
)

type Choice struct {
	Label   string `json:"label"`
	Correct bool   `json:"correct"`
}

type Question struct {
	Name    string   `json:"name"`
	Prompt  string   `json:"prompt"`
	Choices []Choice `json:"choices"`
}

func main() {
	database.Connect()

	data, err := os.ReadFile("survey.json")

	if err != nil {
		panic(err)
	}

	var questions []Question
	err = json.Unmarshal(data, &questions)

	if err != nil {
		panic(err)
	}

	var surveyQuestions []models.Question
	for _, question := range questions {
		var answers []models.Answer

		for _, choice := range question.Choices {
			answers = append(answers, models.Answer{
				Answer:  choice.Label,
				Correct: choice.Correct,
			})
		}
		surveyQuestions = append(surveyQuestions, models.Question{
			Answers:  answers,
			Question: question.Prompt,
			Weight:   1,
		})
	}

	survey := models.Survey{
		ObtentionRate: 50,
		Questions:     surveyQuestions,
	}

	ctx := context.Background()
	err = gorm.G[models.Survey](database.DB).Create(ctx, &survey)

	if err != nil {
		panic(err)
	}

	fmt.Println("Created survey!")
}
