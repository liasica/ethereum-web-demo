package service

import (
    "context"
    "errors"
    "fmt"
    "github.com/golang-jwt/jwt/v4"
    "time"
)

var (
    ErrAuthError = errors.New("auth failed")
)

type jwtService struct {
    ctx        context.Context
    hmacSecret []byte
    issuer     string
    duration   time.Duration
}

func NewJwt(hmacSecret string, issuer string, duration time.Duration) *jwtService {
    return &jwtService{
        ctx:        context.Background(),
        hmacSecret: []byte(hmacSecret),
        issuer:     issuer,
        duration:   duration,
    }
}

func (s *jwtService) CreateStandard(subject string) (string, error) {
    now := time.Now()
    claims := jwt.RegisteredClaims{
        Issuer:    s.issuer,
        Subject:   subject,
        IssuedAt:  jwt.NewNumericDate(now),
        ExpiresAt: jwt.NewNumericDate(now.Add(s.duration)),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(s.hmacSecret)
}

func (s *jwtService) Verify(tokenString string) (*jwt.RegisteredClaims, error) {
    token, err := jwt.ParseWithClaims(tokenString, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
        }
        return s.hmacSecret, nil
    })
    if err != nil {
        return nil, ErrAuthError
    }
    if claims, ok := token.Claims.(*jwt.RegisteredClaims); ok && token.Valid {
        return claims, nil
    }
    return nil, ErrAuthError
}
