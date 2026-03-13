package com.oculus.asistencia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class OculusApplication {

	public static void main(String[] args) {
		SpringApplication.run(OculusApplication.class, args);
	}

}
