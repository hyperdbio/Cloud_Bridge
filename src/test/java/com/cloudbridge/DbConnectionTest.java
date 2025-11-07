package com.cloudbridge;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;
import java.sql.Connection;

@SpringBootTest
public class DbConnectionTest {

    @Autowired
    private DataSource dataSource; // 스프링이 관리하는 DB 연결 풀

    // DB 연결 TEST
    @Test
    void DB연결_테스트() {
        try (Connection conn = dataSource.getConnection()) {
            System.out.println("✅ DB 연결 성공!");
            System.out.println("연결 정보: " + conn.getMetaData().getURL());
        } catch (Exception e) {
            System.out.println("❌ DB 연결 실패!");
            e.printStackTrace();
        }
    }
}