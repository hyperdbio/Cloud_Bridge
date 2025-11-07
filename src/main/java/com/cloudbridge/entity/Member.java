package com.cloudbridge.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "member")
@Getter
@Setter
@NoArgsConstructor
public class Member {

    @Id
    @Column(name = "MEMBER_ID", nullable = false, length = 10)
    private String memberId;   // ✅ camelCase (이게 핵심)

    @Column(name = "NAME", length = 50, nullable = false)
    private String name;       // ✅ camelCase

    @Column(name = "PHONE", length = 20, nullable = false, unique = true)
    private String phone;      // ✅ camelCase
}
