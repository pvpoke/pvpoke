from selenium import webdriver
from selenium.webdriver.support.select import Select
from selenium.webdriver.common.by import By

from BattlePage import BattlePage

import time


class TrainSetupPage:
    
    # Your Team - Import/Export button
    team_import_export_btn = '.poke .export-btn'
    # Settings - League & Cup Dropdown
    league_select = '.poke.ai-options .league-cup-select'
    # Settings - Difficulty Dropdown
    difficulty_select ='.poke.ai-options .difficulty-select'
    # Settings - Team Selection Dropdown (opponent)
    opp_team_method_select = '.poke.ai-options .team-method-select'
    # Settings - Import/Export button (opponent)
    opp_team_import_export_btn = '.poke.ai-options .export-btn'
    # Battle button
    battle_btn = '.battle-btn'

    def __init__(self, driver):
        self.driver = driver
        self.driver.get('http://localhost/pvpoke/src/train/')
        #self.driver.implicity_wait(0.1)

        self.import_window = self.ImportTeamWindow(self.driver)


    # Helper class for import window
    class ImportTeamWindow:

        # Team CSV text box
        team_text = '.modal .list-export .list-text'
        # Import Button
        import_btn = '.modal .list-export .import'


        def __init__(self, driver):
            self.driver = driver

        def import_team(self, team):
            self.driver.find_element_by_css_selector(self.team_text).send_keys(team)
            self.driver.find_element_by_css_selector(self.import_btn).click()


    # team organised in some sort of tuple-list or pandas object, or csv string
    def set_team(self, team):
        self.driver.find_element_by_css_selector(self.team_import_export_btn).click()
        self.import_window.import_team(team)

    def set_opp_team(self, team):
        Select(self.driver.find_element_by_css_selector(self.opp_team_method_select)).select_by_value('manual')

        self.driver.find_element_by_css_selector(self.opp_team_import_export_btn).click()
        self.import_window.import_team(team)


    def set_league(self, league):
        Select(self.driver.find_element_by_css_selector(self.league_select)).select_by_value(league)

    def set_difficulty(self, difficulty):
        Select(self.driver.find_element_by_css_selector(self.difficulty_select)).select_by_value(difficulty)

    # returns BattlePage object
    def battle(self):
        self.driver.find_element_by_css_selector(self.battle_btn).click()
        return BattlePage(self.driver)
