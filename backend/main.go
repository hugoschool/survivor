package main

import (
	"os"

	"github.com/gin-gonic/gin"
	"github.com/hugoarnal/survivor/database"
	"github.com/hugoarnal/survivor/middlewares"
	"github.com/hugoarnal/survivor/routes"

	_ "github.com/hugoarnal/survivor/docs"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
	if os.Getenv("JWT_SECRET") == "" {
		panic("JWT_SECRET not found")
	}

	router := gin.Default()

	database.Connect()
	database.Migrate()

	account := router.Group("/account")
	account.POST("/login", routes.LoginHandler)
	account.POST("/register", routes.RegisterHandler)

	survey := router.Group("/survey")
	survey.GET("", middlewares.AuthMiddleware, routes.SurveyGetHandler)
	survey.POST("", middlewares.AuthMiddleware, middlewares.AdminMiddleware, routes.SurveyPostHandler)
	survey.PUT("", middlewares.AuthMiddleware, middlewares.AdminMiddleware, routes.SurveyPutHandler)

	router.GET("/ping", routes.PingHandler)
	router.GET("/ping/auth", middlewares.AuthMiddleware, routes.PingHandler)
	router.GET("/ping/admin", middlewares.AuthMiddleware, middlewares.AdminMiddleware, routes.PingHandler)
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	err := router.Run(":8080")
	if err != nil {
		panic(err)
	}
}
