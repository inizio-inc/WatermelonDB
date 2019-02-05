package com.nozbe.watermelondb;

import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.security.KeyPairGeneratorSpec;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.text.TextUtils;
import android.util.Base64;

import java.io.IOException;
import java.math.BigInteger;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.UnrecoverableEntryException;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.UUID;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.security.auth.x500.X500Principal;

/**
 * Created by Andrey Guzyuk on 2/4/19.
 */

public class Encryptor {
    private static final String ANDROID_KEY_STORE = "AndroidKeyStore";
    private static final String ALIAS = "com.nozbe.watermelondb";

    private static String getRandomString() {
        return UUID.randomUUID().toString().replaceAll("-", "").toUpperCase();
    }

    public static String getKey(Context context, String key) {
        SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(context);

        final String preferenceKey = prefs.getString(key, "");

        if (!TextUtils.isEmpty(preferenceKey)) {
            try {
                return decrypt(preferenceKey);
            } catch (CertificateException | NoSuchAlgorithmException | KeyStoreException | IOException | IllegalBlockSizeException | UnrecoverableEntryException | InvalidKeyException | NoSuchPaddingException | BadPaddingException e) {
                e.printStackTrace();
            }
        }

        String encryptedKey = null;
        String valueToBeStored = getRandomString();

        try {
            encryptedKey = encrypt(context, valueToBeStored);
        } catch (IllegalBlockSizeException | InvalidKeyException | NoSuchPaddingException | NoSuchAlgorithmException | CertificateException | BadPaddingException | UnrecoverableEntryException | KeyStoreException | InvalidAlgorithmParameterException | NoSuchProviderException | IOException e) {
            e.printStackTrace();
        }
        prefs.edit().putString(key, encryptedKey).apply();

        return valueToBeStored;
    }

    private static KeyStore.Entry createKeys(Context context) throws KeyStoreException, CertificateException, NoSuchAlgorithmException, IOException, NoSuchProviderException, InvalidAlgorithmParameterException, UnrecoverableEntryException {
        KeyStore keyStore = KeyStore.getInstance(ANDROID_KEY_STORE);
        keyStore.load(null);
        boolean containsAlias = keyStore.containsAlias(ALIAS);

        if (!containsAlias) {
            KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA", ANDROID_KEY_STORE);

            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                KeyGenParameterSpec spec = new KeyGenParameterSpec.Builder(
                        ALIAS,
                        KeyProperties.PURPOSE_DECRYPT | KeyProperties.PURPOSE_ENCRYPT
                )
                        .setDigests(KeyProperties.DIGEST_SHA256, KeyProperties.DIGEST_SHA512)
                        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_RSA_PKCS1)
                        .build();

                kpg.initialize(spec);

            } else {
                final Calendar start = new GregorianCalendar();
                final Calendar end = new GregorianCalendar();
                end.add(Calendar.YEAR, 100);

                final KeyPairGeneratorSpec spec = new KeyPairGeneratorSpec.Builder(context)
                        .setAlias(ALIAS)
                        .setSubject(new X500Principal("CN=" + ALIAS))
                        .setSerialNumber(BigInteger.ONE)
                        .setStartDate(start.getTime())
                        .setEndDate(end.getTime())
                        .build();

                kpg.initialize(spec);
            }

            kpg.generateKeyPair();
        }
        return keyStore.getEntry(ALIAS, null);
    }

    private static byte[] encryptUsingKey(PublicKey publicKey, byte[] bytes) throws BadPaddingException, IllegalBlockSizeException, InvalidKeyException, NoSuchPaddingException, NoSuchAlgorithmException {
        Cipher inCipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
        inCipher.init(Cipher.ENCRYPT_MODE, publicKey);
        return inCipher.doFinal(bytes);
    }

    private static byte[] decryptUsingKey(PrivateKey privateKey, byte[] bytes) throws NoSuchPaddingException, NoSuchAlgorithmException, InvalidKeyException, BadPaddingException, IllegalBlockSizeException {
        Cipher inCipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
        inCipher.init(Cipher.DECRYPT_MODE, privateKey);
        return inCipher.doFinal(bytes);
    }

    private static String encrypt(Context context, String plainText) throws IllegalBlockSizeException, InvalidKeyException, NoSuchPaddingException, NoSuchAlgorithmException, BadPaddingException, CertificateException, KeyStoreException, UnrecoverableEntryException, NoSuchProviderException, InvalidAlgorithmParameterException, IOException {

        KeyStore.Entry entry = createKeys(context);

        if (entry instanceof KeyStore.PrivateKeyEntry) {

            Certificate certificate = ((KeyStore.PrivateKeyEntry) entry).getCertificate();
            PublicKey publicKey = certificate.getPublicKey();

            byte[] bytes = plainText.getBytes("UTF-8");
            byte[] encryptedBytes = encryptUsingKey(publicKey, bytes);
            byte[] base64encryptedBytes = Base64.encode(encryptedBytes, Base64.DEFAULT);

            return new String(base64encryptedBytes);
        }
        return null;
    }

    private static String decrypt(String cipherText) throws CertificateException, NoSuchAlgorithmException, IOException, KeyStoreException, UnrecoverableEntryException, IllegalBlockSizeException, InvalidKeyException, BadPaddingException, NoSuchPaddingException {
        KeyStore keyStore = KeyStore.getInstance(ANDROID_KEY_STORE);
        keyStore.load(null);

        KeyStore.Entry entry = keyStore.getEntry(ALIAS, null);
        if (entry instanceof KeyStore.PrivateKeyEntry) {

            PrivateKey privateKey = ((KeyStore.PrivateKeyEntry) entry).getPrivateKey();

            byte[] bytes = cipherText.getBytes("UTF-8");

            byte[] base64encryptedBytes = Base64.decode(bytes, Base64.DEFAULT);
            byte[] decryptedBytes = decryptUsingKey(privateKey, base64encryptedBytes);
            return new String(decryptedBytes);
        }
        return null;
    }

}
