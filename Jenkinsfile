pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'cd frontend && npm install'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'cd frontend && npm test'
            }
        }
    }

    post {
        success {
            echo 'Frontend tests passed successfully!'
        }

        failure {
            echo 'Frontend tests failed!'
        }
    }
}