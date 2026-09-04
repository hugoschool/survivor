package main

import (
	"os"

	"github.com/gin-gonic/gin"
	"github.com/hugoarnal/survivor/database"
	"github.com/hugoarnal/survivor/middlewares"
	"github.com/hugoarnal/survivor/routes"

	cors "github.com/gin-contrib/cors"
	_ "github.com/hugoarnal/survivor/docs"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
	if os.Getenv("JWT_SECRET") == "" {
		panic("JWT_SECRET not found")
	}

	router := gin.Default()

	// TODO: change this for a proper CORS config asap
	router.Use(cors.Default())

	database.Connect()
	database.Migrate()

	account := router.Group("/account")
	account.POST("/login", routes.LoginHandler)
	account.POST("/register", routes.RegisterHandler)

	survey := router.Group("/survey")
	survey.GET("", middlewares.AuthMiddleware, routes.SurveyGetHandler)
	survey.POST("", middlewares.AuthMiddleware, middlewares.AdminMiddleware, routes.SurveyPostHandler)
	survey.PUT("", middlewares.AuthMiddleware, middlewares.AdminMiddleware, routes.SurveyPutHandler)
	survey.POST("/submit", middlewares.AuthMiddleware, routes.SurveySubmitHandler)

	users := router.Group("/users")
	users.GET("/:id", routes.UserGetHandler)
	users.GET("", routes.UsersPaginatedHandler)
	users.GET("/me", middlewares.AuthMiddleware, routes.UserGetCurrentHandler)
	// users.PUT("/:id", middlewares.AuthMiddleware, middlewares.AdminMiddleware, routes.UserUpdateHandler)
	users.DELETE("/:id", middlewares.AuthMiddleware, middlewares.AdminMiddleware, routes.UserDeleteHandler)

	videos := router.Group("/videos")
	videos.GET("", routes.VideosPaginatedHandler)
	videos.POST("/link", middlewares.AuthMiddleware, routes.VideoLinkUploadHandler)

	router.GET("/health", routes.HealthHandler)
	router.GET("/ping", routes.PingHandler)
	router.GET("/ping/auth", middlewares.AuthMiddleware, routes.PingHandler)
	router.GET("/ping/admin", middlewares.AuthMiddleware, middlewares.AdminMiddleware, routes.PingHandler)
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	err := router.Run(":8080")
	if err != nil {
		panic(err)
	}
}
