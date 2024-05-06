import { changeSetting } from "./settings.js";

// Function to set up account verification UI.
export async function setUpAccountVerification() {
  await eel.get_codes()((codes) => {
    let signInCode = document.getElementById("verify_code");
    signInCode.innerText = codes.sign_in_code;
    let deviceCode = codes.device_code;
    let verifyButton = document.getElementById("verify_button");

    // Event handler for verification button click.
    verifyButton.onclick = async function() {
      await eel.verify_account(deviceCode)((result) => {
        if (result) {
          verifyAccount();
        }
        else {
          // Re-setup account verification if failed.
          setUpAccountVerification();
        }
      });
    }

    let unlinkAccountButton = document.getElementById("unlink_account");
    // Event handler for unlinking account button click.
    unlinkAccountButton.onclick = function() {
      unlinkAccount();
    }
  })
}

// Function to verify account.
export async function verifyAccount() {
  // Update UI.
  let accountStatusIcon = document.getElementsByClassName("account_status_icon")[0];
  accountStatusIcon.src = "./images/check_circle.svg";
  let accountStatusText = document.getElementById("account_status_text");
  accountStatusText.innerHTML = "Account linked!";
  let unlinkedAccount = document.getElementById("unlinked_account");
  unlinkedAccount.style.display = "none";
  let unlinkAccountButton = document.getElementById("unlink_account");
  unlinkAccountButton.style.display = "block";

  // Update setting.
  changeSetting("account_linked", "true");
  await eel.set_signed_in(true)();
  await eel.update_setting("account_linked", "true")();
}

// Function to unlink account.
export async function unlinkAccount() {
  // Update UI.
  let accountStatusIcon = document.getElementsByClassName("account_status_icon")[0];
  accountStatusIcon.src = "./images/cancel_circle.svg";
  let accountStatusText = document.getElementById("account_status_text");
  accountStatusText.innerHTML = "Account not linked.";
  let unlinkedAccount = document.getElementById("unlinked_account");
  unlinkedAccount.style.display = "flex";
  let unlinkAccountButton = document.getElementById("unlink_account");
  unlinkAccountButton.style.display = "none";

  // Update setting and reshow account verification UI.
  changeSetting("account_linked", "false");
  setUpAccountVerification();
  await eel.set_signed_in(false)();
  await eel.update_setting("account_linked", "false")();
}
