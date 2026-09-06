package database

import (
	"fmt"
	"os"

	"github.com/hugoschool/survivor/models"
)

func Migrate() {
	err := DB.AutoMigrate(
		&models.User{},
		&models.Login{},
		&models.Sector{},
		&models.Video{},
		&models.Skill{},
		&models.Location{},

		&models.Survey{},
		&models.Question{},
		&models.Answer{},
	)

	if err != nil {
		fmt.Fprintf(os.Stderr, "Error while migrating: %v\n", err)
	}
}
