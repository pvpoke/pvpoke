from selenium import webdriver
from selenium.webdriver.common.by import By

import time

class BattlePage:

    #### CSS SELECTORS ###
    # Battle Window (contains all battle elements)
    battle_window = '.battle-window'
    ### Top ###
    # Timer
    timer = '.top .timer .text'
    # Pokemon Name
    poke_name = '.top .team-indicator.left .name'
    # Pokemon CP
    poke_cp = '.top .team-indicator.left .cp'
    # List of ball elements
    balls = '.top .team-indicator.left .balls .ball'
    # Shields Remaining
    shields_remaining = '.top .team-indicator.left .shields'
    # Opponent Pokemon Name
    opp_poke_name = '.top .team-indicator.right .name'
    # Opponent Pokemon CP
    opp_poke_cp = '.top .team-indicator.right .cp'
    # Opponent Balls Container
    opp_balls = '.top .team-indicator.right .balls .ball'
    # Opponent Shields Remaining
    opp_shields_remaining = '.top .team-indicator.right .shields'

    ### Scene ###
    # Pokemon HP Remaining
    poke_hp = '.scene .self .hp .bar'
    # Opponent Pokemon HP Remaining
    opp_poke_hp = '.scene .opponent .hp .bar'
    
    ### Controls ###
    # List of charged moves
    move_bars = '.controls .move-bars .move-bar'
    
    ### Shield Window ###
    # Shield Window
    shield_window = '.shield-window'
    # Shield Button
    shield_btn = '.shield-window .shield'
    # Not Now button (do not use shield)
    close_btn = '.shield-window .close'

    ### Charge Window ###
    # Charge Button (for charging charged move)
    charge_btn = '.charge-window .charge'

    ### Switch ###
    # List of pokemon in switch sidebar
    switch_sidebar_pokes = '.switch-sidebar .pokemon'
    # Switch Timer
    switch_timer = '.switch-sidebar .switch-timer'

    ### Switch Window ###
    # List of pokemon in switch window
    switch_window_pokes = '.switch-window .pokemon'

    ### Animate Message ###
    # Animate Message
    animate_message = '.animate-message .text'
    

    def __init__(self, driver):
        self.driver = driver
        self.end_screen = self.EndScreenWindow(self.driver)


    def get_time(self):
        time = self.driver.find_element_by_css_selector(self.timer).text
        return int(time) if time != '' else -1

    def get_name(self):
        return self.driver.find_element_by_css_selector(self.poke_name).text

    # Text Format "CP XXXX"
    def get_cp(self):
        return int(self.driver.find_element_by_css_selector(self.poke_cp).text[3:])


    def get_remaining_poke(self):
        poke_balls = self.driver.find_elements_by_css_selector(self.balls)
        poke_remaining = [ball for ball in poke_balls if 'fainted' not in ball.get_attribute('class')]
        return len(poke_remaining)

    def get_shields_remaining(self):
        return int(self.driver.find_element_by_css_selector(self.shields_remaining).text)

    def get_opp_name(self):
        return self.driver.find_element_by_css_selector(self.opp_poke_name).text

    def get_opp_cp(self):
        return int(self.driver.find_element_by_css_selector(self.opp_poke_cp).text[3:])

    def get_opp_remaining_poke(self):
        poke_balls = self.driver.find_elements_by_css_selector(self.opp_balls)
        poke_remaining = [ball for ball in poke_balls if 'fainted' not in ball.get_attribute('class')]
        return len(poke_remaining)

    def get_opp_shields_remaining(self):
        return int(self.driver.find_element_by_css_selector(self.opp_shields_remaining).text)

    # Format "width XX.XXXX%;"
    def get_poke_hp(self):
        poke_hp_elem = self.driver.find_element_by_css_selector(self.poke_hp)
        return float(poke_hp_elem.get_attribute('style')[7:-2])

    def get_opp_hp(self):
        poke_hp_elem = self.driver.find_element_by_css_selector(self.opp_poke_hp)
        return float(poke_hp_elem.get_attribute('style')[7:-2])

    # Charge format "top XX.Xpx;"
    def get_charged_moves(self):
        charged_move_elems = self.driver.find_elements_by_css_selector(self.move_bars)
        charged_moves = []
        for charged_move in charged_move_elems:
            ready = 'active' in charged_move.get_attribute('class')
            bars = charged_move.find_elements_by_css_selector('.bar')

            charges = []
            for bar_i in range(len(bars)):
                if bar_i == 0:
                    charges.append(66.0-float(bars[bar_i].get_attribute('style')[5:-3])/66.0)
                else:
                    charges.append(66.0-float(bars[bar_i].get_attribute('style')[5:-3])/68.0)

            charged_moves.append((charged_move, ready, charges))

        return charged_moves

    # Format "xXX%"
    def get_charge(self):
        charge_elem = self.driver.find_element_by_css_selector(self.charge_btn)
        return int(charge_elem.text[:-1]) if charge_elem.text != '' else 0

    def get_sidebar_party(self):
        party = []
        for poke in self.driver.find_elements_by_css_selector(self.switch_sidebar_pokes):
            num = int(poke.get_attribute('index'))
            name = poke.find_element_by_css_selector('.name').text
            fainted = 'active' in poke.get_attribute('class')
            # health bar maxes at 75%
            #health = float(poke.find_element_by_css_selector('.health').text[7:-2])
            party.append((poke, num, name, fainted))
        return party

    def get_switch_timer(self):
        switch_timer_elem = self.driver.find_element_by_css_selector(self.switch_timer)
        return int(switch_timer_elem.text) if switch_timer_elem.text != '' else 0


    def get_switch_window_party(self):
        party = []
        for poke in self.driver.find_elements_by_css_selector(self.switch_window_pokes):
            num = int(poke.get_attribute('index'))
            name = poke.find_element_by_class_name('name').text
            # health bar maxes at 75%
            #health = float(poke.find_element_by_class_name('health').text[7:-2])
            party.append((poke, num, name))
        return party

    def get_battle_phase(self):
        return self.driver.find_element_by_css_selector(self.battle_window).get_attribute('phase')

    # condition: battle phase is suspend_charged_shield
    def use_shield(self):
        if self.get_battle_phase() != 'suspend_charged_shield':
            print('battle phase is not approriate (battle phase is '+self.get_battle_phase()+')')
            pass

        if 'closed' not in self.driver.find_element_by_css_selector(self.shield_window).get_attribute('class'):
            self.driver.find_element_by_css_selector(self.shield_btn).click()

    # condition: battle phase is suspend_charged_shield
    def close_shield(self):
        if self.get_battle_phase() != 'suspend_charged_shield':
            print('battle phase is not approriate (battle phase is '+self.get_battle_phase()+')')
            pass

        if 'closed' not in self.driver.find_element_by_css_selector(self.shield_window).get_attribute('class'):
            self.driver.find_element_by_css_selector(self.close_btn).click()

    # condition: battle phase is suspend_charged_attack
    # can change this to increase charge by increments of 0.1 seconds to finely control charge power
    def charge_move(self, charge_amt):
        if self.get_battle_phase() != 'suspend_charged_attack':
            print('battle phase is not approriate (battle phase is '+self.get_battle_phase()+')')
            pass

        charge = self.get_charge()
        if charge < charge_amt:
            webdriver.ActionChains(self.driver).click_and_hold( \
                self.driver.find_element_by_css_selector(self.charge_btn)).perform()
            time.sleep(0.2)
            webdriver.ActionChains(self.driver).release().perform()

    # condition: battle phase is suspend_switch_self and chosen pokemon isn't fainted
    # might change to switch using pokemon name
    def switch_fainted_poke(self, poke_num):
        if self.get_battle_phase() != 'suspend_switch_self':
            print('battle phase is not approriate (battle phase is '+self.get_battle_phase()+')')
            pass

        pokemon = [poke for poke in self.get_switch_window_party() if poke_num == poke[1]][0]
        pokemon[0].click()

    # condition: battle phase is neutral, switch timer is at 0
    # might change to switch using pokemon name
    # might create a pokemon class to contain this info
    def switch_sidebar_poke(self, poke_num):
        if self.get_battle_phase() != 'neutral':
            print('battle phase is not approriate (battle phase is '+self.get_battle_phase()+')')
            pass

        if self.get_switch_timer() == 0:
            pokemon = [poke for poke in self.get_sidebar_party() if poke_num == poke[1]][0]
            if pokemon[3]:
                print('chosen pokemon is fainted')
                pass
            pokemon[0].click()

    #condition: battle phase is neutral and charged move has enough energy
    def use_charged_move(self, charged_num):
        if self.get_battle_phase() != 'neutral':
            print('battle phase is not approriate (battle phase is '+self.get_battle_phase()+')')
            pass

        charged_move = self.get_charged_moves()[charged_num]
        if not charged_move[1]:
            raise Exception('charged move not ready')
        charged_move[0].click()

    # condition: battle phase is neutral
    def use_fast_move(self):
        if self.get_battle_phase() != 'neutral':
            print('battle phase is not approriate (battle phase is '+self.get_battle_phase()+')')
            pass

        self.driver.find_element_by_css_selector(self.battle_window).click()

    # do i want this to be a subclass
    class EndScreenWindow:

        result = '.end-screen .result'

        new_match_btn = '.end-screen .new-match'

        rematch_btn = '.end-screen .replay'

        def __init__(self, driver):
            self.driver = driver

        def get_game_result(self):
            return self.driver.find_element_by_css_selector(self.result).text

        def new_match(self):
            self.driver.find_element_by_css_selector().click(self.new_match_btn)

        # do i want this to return a new battlepage
        def rematch(self):
            self.driver.find_element_by_css_selector().click(self.rematch_btn)

    def get_game_result(self):
        return self.end_screen.get_game_result()

    def new_match(self):
        self.end_screen.new_match()
        return TrainSetupPage(self.driver)


    # do i want this to return a new battle page
    def rematch(self):
        self.end_screen.rematch()
