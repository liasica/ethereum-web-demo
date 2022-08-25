// Copyright (C) liasica. 2022-present.
//
// Created at 2022-08-25
// Based on wallet-sign-demo by liasica, magicrolan@qq.com.

package main

import (
    "crypto/ecdsa"
    "crypto/rand"
    "errors"
    "github.com/ethereum/go-ethereum/accounts"
    "github.com/ethereum/go-ethereum/common/hexutil"
    "github.com/ethereum/go-ethereum/crypto"
    "github.com/labstack/echo/v4"
    mw "github.com/labstack/echo/v4/middleware"
    "github.com/liasica/liasica-ethereum-web-demo/service"
    "log"
    "math/big"
    "net/http"
    "strings"
    "time"
)

const (
    HeaderDispositionType = "Content-Disposition"
    // HeaderContentType the ContentType Header
    HeaderContentType = "Content-Type"
    // HeaderMemberToken memeber's token
    HeaderMemberToken = "X-Member-Token"
)

var (
    ErrAuthError = errors.New("auth failed")
)

type Res[T any] struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
    Data    T      `json:"data"`
}

type MemberNonceRes struct {
    Nonce string `json:"nonce"`
}

type MemberSigninRes struct {
    Token string `json:"token"`
}

type MemberSigninReq struct {
    Address   string `json:"address"`
    Signature string `json:"signature"`
    Nonce     string `json:"nonce"`
}

func main() {
    r := echo.New()

    corsConfig := mw.DefaultCORSConfig
    corsConfig.AllowHeaders = append(corsConfig.AllowHeaders, []string{
        HeaderContentType,
        HeaderMemberToken,
    }...)
    corsConfig.ExposeHeaders = append(corsConfig.ExposeHeaders, []string{
        HeaderContentType,
        HeaderDispositionType,
    }...)

    r.Use(
        mw.CORSWithConfig(corsConfig),
        mw.LoggerWithConfig(mw.LoggerConfig{
            Format: `{"time":"${time_custom}","id":"${id}","remote_ip":"${remote_ip}",` +
                `"method":"${method}","uri":"${uri}",` +
                `"status":${status},"error":"${error}","latency":${latency},"latency_human":"${latency_human}"` +
                `,"bytes_in":${bytes_in},"bytes_out":${bytes_out}}` + "\n",
            CustomTimeFormat: "2006-01-02 15:04:05.00000",
        }),
    )

    r.GET("/", func(c echo.Context) error {
        return c.JSON(http.StatusOK, "yes")
    })

    r.GET("/member/nonce/:address", func(c echo.Context) error {
        log.Println("nonce")
        max := new(big.Int)
        max.Exp(big.NewInt(2), big.NewInt(130), nil).Sub(max, big.NewInt(1))
        n, _ := rand.Int(rand.Reader, max)
        nonce := n.Text(16)
        log.Println(c.Param("address"), nonce)
        return c.JSON(http.StatusOK, Res[MemberNonceRes]{Code: http.StatusOK, Message: "ok", Data: MemberNonceRes{Nonce: nonce}})
    })

    r.POST("/member", func(c echo.Context) (err error) {
        req := new(MemberSigninReq)
        _ = c.Bind(req)
        // decode the provided signature
        sig := hexutil.MustDecode(req.Signature)
        // see at https://github.com/ethereum/go-ethereum/blob/master/internal/ethapi/api.go#L516
        sig[crypto.RecoveryIDOffset] -= 27
        // hash nonce
        msg := accounts.TextHash([]byte(req.Nonce))
        // recover the public key that signed data
        var pub *ecdsa.PublicKey
        pub, err = crypto.SigToPub(msg, sig)
        if err != nil {
            return
        }
        // create an ethereum address from the extracted public key
        recoveredAddr := crypto.PubkeyToAddress(*pub)
        // validate member's address
        if req.Address != strings.ToLower(recoveredAddr.Hex()) {
            err = ErrAuthError
            return
        }
        // generate jwt token
        var token string
        token, err = service.NewJwt(req.Nonce, req.Address, 24*time.Hour).CreateStandard(req.Address)
        if err != nil {
            return
        }
        return c.JSON(http.StatusOK, Res[MemberSigninRes]{Code: http.StatusOK, Message: "ok", Data: MemberSigninRes{Token: token}})
    })

    log.Fatal(r.Start(":5501"))
}
