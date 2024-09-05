package config

import (
	"log"

	"github.com/spf13/viper"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
}

var Cfg *Config

func InitConfig() {
	viper.SetConfigName("config")
	viper.SetConfigType("json")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./backend")

	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("Error reading config file, %s", err)
	}

	Cfg = &Config{
		DBHost:     viper.GetString("database.host"),
		DBPort:     viper.GetString("database.port"),
		DBUser:     viper.GetString("database.user"),
		DBPassword: viper.GetString("database.password"),
		DBName:     viper.GetString("database.dbname"),
	}
}
