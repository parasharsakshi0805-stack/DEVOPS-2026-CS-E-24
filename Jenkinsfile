pipeline {
    agent any

    environment {
        MONGO_URI   = credentials('mongo-uri')
        JWT_SECRET  = credentials('jwt-secret')
    }

    tools {
        nodejs 'node20'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install backend dependencies') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Run backend tests') {
            steps {
                dir('backend') {
                    sh 'npm test'
                }
            }
        }
    }

    post {
        always {
            junit testResults: 'backend/junit.xml', allowEmptyResults: true
        }
        failure {
            echo 'Backend tests failed - check the JUnit report and console output above.'
        }
    }
}