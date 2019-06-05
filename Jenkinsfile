#!groovy

@Library('blockr-jenkins-lib') _

String repo = 'blockr-validator'

Map settings = [
    sonar_key: 'blockr-validator',
    source_folder: 'src/',
    source_exclusions: 'src/__test__/**/*,src/**/index.ts,src/main.ts,src/injection/**/*',
    archive_folders: ['dist/']
]

tsDockerBuildAndPublish(repo, settings)