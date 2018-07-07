/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { html } from '@polymer/lit-element';
import { PageViewElement } from './page-view-element.js';
import { connect } from 'pwa-helpers/connect-mixin.js';

import { store } from '../store.js';

import {
  navigate
} from '../actions/app.js';

import {
  pay
} from '../actions/wallet.js';

// These are the actions needed by this element.
import wallet from '../reducers/wallet.js';
store.addReducers({
  wallet
});

// These are the elements needed by this element.
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/maps-icons.js';
import '@polymer/iron-icons/editor-icons.js';
import '@polymer/paper-tabs/paper-tabs.js';
import '@polymer/paper-tabs/paper-tab.js';
import '@polymer/paper-styles/typography.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-toast/paper-toast.js';
import './ecopay-page';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles.js';

class EcopayEPayment extends connect(store)(PageViewElement) {
  _render({_view,_amount,_payingTo,_selectedItemLabel}) {
    return html`
      ${SharedStyles}
      <style>
      paper-tab a{
        @apply --layout-horizontal;
        @apply --layout-center-center;
      }

      .main-container {
        @apply --layout-vertical;
      }

      .container {
        margin-top: 48px;
      }

      .confirm-container {
        margin: 48px 24px 24px 48px;
      }
      iron-icon, div[suffix] {
        margin-right: 12px;
      }

      paper-input {
        padding: 0px 24px;
        --paper-input-container-input: {
          font-size: 20px;
        };
      }

      paper-dropdown-menu {
        padding: 0px 24px;
      }

      .heading {
        @apply --paper-font-title;
        margin: 4px;
        font-weight: bold;
      }
      
      .value {
        @apply --paper-font-headline;
        margin: 4px;
        font-weight: bold;
      }
      
      .pin-container {
          @apply --layout-self-center;
          @apply --layout-vertical;
          @apply --layout-center-center;
          margin-top: 75px;
          @apply --paper-font-title;
          font-weight: bold;
        }
        #pin {
            text-align: center;
            width: 170px;
        }
        #pin .input-element {
            font-size: 50px;
        }
      </style>
      <ecopay-page mainTitle="ePayment - Pay"
        on-confirm-clicked="${(e) => this._onConfirmClicked(e)}"
        on-close-clicked="${(e) => this._onClosedClicked(e)}"
        on-back-clicked="${(e) => this._onBackClicked(e)}"
        closeHref="/home" showBalance>
        <section>
        <paper-tabs on-click="${(e) => this._onTabClick(e)}" selected="0" no-slide >
          <paper-tab title="ePayment"><a href="/epayment"><iron-icon icon="credit-card"></iron-icon></a></paper-tab>
          <paper-tab title="Merchant"><a href="/merchant"><iron-icon icon="maps:restaurant"></iron-icon></a></paper-tab>
          <paper-tab title="Finance managment"><a href="/finance-management"><iron-icon icon="thumb-up"></iron-icon></a></paper-tab>
        </paper-tabs>
          <section class="main-container"> 
            <section class="container" hidden="${_view === 'confirmation'}">
              <paper-input label="Key In Amount" type="number" id="amount"
               allowed-pattern="[0-9]" pattern="[0-9]" auto-validate="true"
               on-value-changed="${(e) => this._onAmounthanged(e)}">
               <iron-icon icon="editor:attach-money" slot="prefix"></iron-icon>
              </paper-input>
              <paper-input label="Paying To" id="payingTo"
               on-value-changed="${(e) => this._onPayingToChanged(e)}"></paper-input>
              <paper-dropdown-menu label="Paying For" no-animations
              on-selected-item-label-changed="${(e) => this._onSelectedItemLabelChanged(e)}" >
                <paper-listbox slot="dropdown-content" selected="1" id="payingFor">
                  <paper-item>Food & Drinks</paper-item>
                  <paper-item>Shopping</paper-item>
                  <paper-item>Bills</paper-item>
                  <paper-item>Hobbies</paper-item>
                  <paper-item>Others</paper-item>
                </paper-listbox>
              </paper-dropdown-menu>
            </section>
            <section class="confirm-container" hidden="${_view !== 'confirmation'}">
              <div class="heading">Confirm payment</div>
              <div class="value">$ ${_amount}</div>
              <div class="heading">to</div>
              <div class="value">${_payingTo}</div>
              <div class="heading">for</div>
              <div class="value">${_selectedItemLabel}</div>
              <div class="pin-container">
                <div>Enter pin to confirm</div>
                <paper-input type="password" id="pin"
                 allowed-pattern="[0-9]" pattern="[0-9]" auto-validate="true"
                 maxlength="6"></paper-input>
               </div> 
            </section>
          <section>
        </setion>
      </ecopay-page>
      <paper-toast id="toast"></paper-toast>
    `;
  }

  static get properties() { return {
    _balance: Number,
    _view: String,
    _selectedItemLabel: String,
    _amount: String,
    _payingTo: String
  }}
    // This is called every time something is updated in the store.
    _stateChanged(state) {
      this._balance = state.wallet.balance;
    }

    _onTabClick(){
      this.shadowRoot.querySelector('paper-tabs').selected = 0;
    }

    _getDate(){
      let d = new Date();
      return ("0" + d.getDate()).slice(-2) + "/" + ("0"+(d.getMonth()+1)).slice(-2) + "/" + d.getFullYear();
    }
    _onConfirmClicked(){

      if(this._view === 'confirmation'){
        if(this._validatePin()) {
            store.dispatch(pay(this._amount, this._getDate(), this._selectedItemLabel, this._payingTo));
            this._view = '';
            this._clearFormData();
            this._navigateToHome();
        }
      } else {
        if(this._validate()){
          this._view = 'confirmation';
        }     
      }
    }

    _clearFormData() {
        this.shadowRoot.querySelector('#amount').value = '';
        this.shadowRoot.querySelector('#payingTo').value = '';
        this.shadowRoot.querySelector('#payingFor').selected = 1;
        this.shadowRoot.querySelector('#pin').value = '';
    }

    _validate(){
      if(!this._amount){
        this._showToast('Amount is required');
        return false;
      }

      if(!this._payingTo){
        this._showToast('PayingTo is required');
        return false;
      }

      if(this._amount > this._balance){
        this._showToast("You don't have enough money");
        return false;
      }
      return true;
    }

    _validatePin(e) {
        var pin = this.shadowRoot.querySelector('#pin');
        if(pin.value != '123456' ){
            this._showToast('Please enter a valid pin');
            pin.focus();
            return false;
        }

        return true;
    }

    _showToast(message){
      var toast = this.shadowRoot.querySelector('#toast');
      toast.text = message;
      toast.open();
    }

    _onClosedClicked(){
      this._clearFormData();
      this._view = 'form';
    }

    _onBackClicked(){
      if(this._view !== 'confirmation'){
        this._navigateToHome();
      } else {
        this._view = 'form';
      }
    }

    _navigateToHome(){
      window.history.pushState({}, '', '/home');
      store.dispatch(navigate(window.decodeURIComponent('/home')));
    }

    _onAmounthanged(e){
      this._amount = e.detail.value;
    }

    _onPayingToChanged(e){
      this._payingTo = e.detail.value;
    }

    _onSelectedItemLabelChanged(e){
      this._selectedItemLabel = e.detail.value;
    }
}

window.customElements.define('ecopay-epayment', EcopayEPayment);
