import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestBCrypt {
    public static void main(String[] args) {
        long start = System.currentTimeMillis();
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(4);
        String hash = encoder.encode("123456");
        long end = System.currentTimeMillis();
        System.out.println("Encode took: " + (end - start) + "ms. Hash: " + hash);

        start = System.currentTimeMillis();
        boolean matches = encoder.matches("wrong_password", hash);
        end = System.currentTimeMillis();
        System.out.println("Matches took: " + (end - start) + "ms. Match: " + matches);
    }
}
