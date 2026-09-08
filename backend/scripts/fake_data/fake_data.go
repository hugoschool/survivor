package main

import (
	"context"
	"fmt"

	"github.com/hugoschool/survivor/database"
	internal "github.com/hugoschool/survivor/internal/video"
	"github.com/hugoschool/survivor/models"
	"github.com/jaswdr/faker/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

const (
	DefaultPassword string = "test"
)

var (
	hash string = ""
)

func GenerateUsers(fake *faker.Faker) {
	usersAmount := 500
	usersGenerated := 0

	fmt.Printf("Generating %d users\n", usersAmount)
	for range usersAmount {
		person := fake.Person()
		firstName := person.FirstNameMale()
		lastName := person.LastName()

		user := models.User{
			FirstName: firstName,
			LastName:  lastName,
			Role:      fake.UIntBetween(models.RoleJobSeeker, models.RoleRecruiter),
			Age:       fake.UIntBetween(18, 100),
			Views:     fake.UIntBetween(0, 10000),

			Login: models.Login{
				Mail:     person.Contact().Email,
				Password: string(hash),
			},
		}

		ctx := context.Background()
		err := gorm.G[models.User](database.DB).Create(ctx, &user)

		if err != nil {
			fmt.Println(err.Error())
			continue
		}

		usersGenerated += 1
	}
	fmt.Printf("Generated %d users\n", usersGenerated)
}

func GenerateVideos() {
	ctx := context.Background()
	users, err := gorm.G[models.User](database.DB).Find(ctx)

	if err != nil {
		panic(err)
	}

	videoUploader, err := internal.GetCurrentVideoUploader()

	if err != nil {
		panic(err)
	}

	if _, ok := videoUploader.(internal.FakeVideoUploader); !ok {
		panic("Video uploader isn't fake, make sure it is by checking your environment variables.")
	}

	videosCreated := 0

	for _, user := range users {
		// Not checking the error here is intended, fake always return a correct id & url
		id, _ := videoUploader.Store(nil)

		video := models.Video{
			UserID:  user.ID,
			VideoID: id,
			// Make sure they are validated directly, as this script shall always be run by an admin
			Status: models.VideoStatus(models.VideoStatusValidated),
		}

		ctx := context.Background()
		err = gorm.G[models.Video](database.DB).Create(ctx, &video)
		if err != nil {
			fmt.Println(err.Error())
			continue
		}

		videosCreated += 1
	}
	fmt.Printf("Generated %d\n", videosCreated)
}

func main() {
	database.Connect()
	database.Migrate()
	fake := faker.New()

	hashBytes, err := bcrypt.GenerateFromPassword([]byte(DefaultPassword), bcrypt.DefaultCost)
	if err != nil {
		panic(err.Error())
	}

	hash = string(hashBytes)

	GenerateUsers(&fake)
	GenerateVideos()
}
