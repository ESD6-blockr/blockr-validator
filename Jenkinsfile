#!groovy

@Library('blockr-jenkins-lib') _

String repo = 'blockr-validator'

Map settings = [
    sonar_key: 'blockr-validator',
    sonar_exclusions: 'src/__test__/**/*,src/**/index.ts,src/main.ts,src/injection/**/*',
    source_folder: 'src/',
    archive_folders: ['dist/']
]

tsDockerBuildAndPublish(repo, settings)