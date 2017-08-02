import el from './common/dom-el.js'
import runtime from '../core/runtime.js'
import createOverlay from './common/create-overlay.js'
import createSignUpUi from './create-sign-up-ui.js'
import createResetPasswordUi from './create-password-reset-request-ui.js'
import message from './create-message-ui.js'
import logIn from '../auth/log-in.js'
import Promise from 'bluebird'

// main

export default function createLogInUi (args) {
  runtime.assertBrowser()
  return new Promise(function (resolve, reject) {

    // params

    args = args || {}
    var credentials = {
      email: args.email,
      password: args.password
    }

    // DOM

    var overlay = createOverlay().show()

    // close button
    el.add('div', {
      text: 'x',
      class: 'button close-button',
      click: function cancel () {
        destroy(function () {
          reject('User canceled action.')
        })
      }
    }).appendTo(overlay.mainEl)

    // stuff at the bottom

    el.add('div', {
      text: 'New? Sign up now.',
      style: 'width:300px;',
      class: 'clickable',
      click: function () {
        destroy(function () {
          createSignUpUi({email: emailEl.val()}).then(resolve, reject)
        })
      }
    }).appendTo(overlay.bottomEl)

    el.add('div', {
      text: 'Lost Password? Get a new one.',
      style: 'width:300px;',
      class: 'clickable',
      click: function () {
        destroy(function () {
          createResetPasswordUi({email: emailEl.val()}).then(resolve, reject)
        })
      }
    }).appendTo(overlay.bottomEl)

    // centered content

    var centerEl = el.add('div', {style: 'width:300px;'}).appendTo(overlay.centerEl)

    el.add('h1', {
      text: 'Log In'
    }).appendTo(centerEl)

    // email field

    el.add('p', {text: 'email:', class: 'hint'}).appendTo(centerEl)
    var emailEl = el.add('input', {type: 'text'}).appendTo(centerEl)
    if (credentials.email) emailEl.val(credentials.email)
    function onEmailElKeyup (e) {
      if (e.which === 13) passwordEl.focus()
    }
    emailEl.addEventListener('keyup', onEmailElKeyup)
    emailEl.addEventListener('input', updateGoButton)

    // password field

    el.add('p', {text: 'password:', class: 'hint'}).appendTo(centerEl)
    var passwordEl = el.add('input', {type: 'password'}).appendTo(centerEl)
    if (credentials.password) passwordEl.val(credentials.password)
    function onPasswordElKeyup (e) {
      if (e.which === 13) confirm()
    }
    passwordEl.addEventListener('keyup', onPasswordElKeyup)
    passwordEl.addEventListener('input', updateGoButton)

    // focus input field

    if (!credentials.email) {
      emailEl.focus()
    } else if (!credentials.password) {
      passwordEl.focus()
    }

    var goButtonEl = el.add('div', {
      text: 'go',
      class: 'button',
      click: confirm
    }).appendTo(centerEl)

    // register ESC key

    function onKeyUp (e) {
      if (e.keyCode === 27) {
        destroy(function () {
          reject('User canceled action.')
        })
      }
    }
    document.body.addEventListener('keyup', onKeyUp)

    // methods

    function updateGoButton () {
      // highlight button if email and password have entries
      emailEl.val() !== '' && passwordEl.val() !== ''
        ? goButtonEl.addClass('button-highlighted')
        : goButtonEl.removeClass('button-highlighted')
    }

    updateGoButton()

    function confirm () {
      // TODO: show loading or provide other visual feedback
      logIn({
        email: emailEl.val(),
        password: passwordEl.val()
      }).then(function onLogInSuccess () {
        // log in successful
        destroy(resolve)
      }, function onLogInReject (error) {
        // show message
        message.error(error)
        // offer to resend activation email
        if (error.indexOf('check your email and activate your account first') > -1) {
          destroy(function () {
            createSignUpUi(
              {email: emailEl.val()},
              {resendActivation: true}
            ).then(resolve, reject)
          })
        }
      })

    }

    function destroy (callback) {
      // unbind events
      document.body.removeEventListener('keyup', onKeyUp)
      emailEl.removeEventListener('keyup', onEmailElKeyup)
      emailEl.removeEventListener('input', updateGoButton)
      passwordEl.removeEventListener('keyup', onPasswordElKeyup)
      passwordEl.removeEventListener('input', updateGoButton)
      // remove DOM elements
      overlay.destroy(callback)
    }

  })
}