#!groovy

@Library('blockr-jenkins-lib@docker-pipeline') _

String repo = 'blockr-validator'

Map settings = [
    sonar_key: 'blockr-validator',
    source_folder: 'src/',
    archive_folders: ['dist/']
]

tsDockerBuildAndDeploy(repo, settings)