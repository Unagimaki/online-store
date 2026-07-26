package logger

import (
	"fmt"
	"log"
)

// ErrorWithContext - функция, которая добавляет к ошибке метаданные
func Error(layer, operation string, err error, format string, args ...any) {
	message := fmt.Sprintf(format, args...)

	log.Printf("[%s] %s: %s: %v",
		layer,
		operation,
		message,
		err,
	)
}
