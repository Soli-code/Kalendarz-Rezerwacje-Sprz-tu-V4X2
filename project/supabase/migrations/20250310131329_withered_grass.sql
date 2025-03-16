/*
  # Dodanie szablonu emaila dla rezerwacji

  1. Nowe elementy
    - Szablon emaila dla nowych rezerwacji
    - Zmienne w szablonie:
      - first_name
      - last_name
      - start_date
      - end_date
      - start_time
      - end_time
      - equipment_list
      - total_price
      - deposit_amount

  2. Bezpieczeństwo
    - Wykorzystanie istniejących polityk dostępu
*/

-- Upewnij się że szablon nie istnieje
DELETE FROM email_templates WHERE name = 'new_reservation';

-- Dodaj szablon emaila dla nowej rezerwacji
INSERT INTO email_templates (name, subject, body)
VALUES (
    'new_reservation',
    'Potwierdzenie rezerwacji sprzętu - SOLRENT',
    jsonb_build_object(
        'html',
        '<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 5px; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
                .important { color: #FF6B00; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="color: #FF6B00;">SOLRENT</h1>
                    <h2>Potwierdzenie rezerwacji</h2>
                </div>
                
                <div class="content">
                    <p>Witaj {{first_name}} {{last_name}},</p>
                    
                    <p>Dziękujemy za dokonanie rezerwacji sprzętu w SOLRENT. Poniżej znajdziesz szczegóły swojej rezerwacji:</p>
                    
                    <h3>Szczegóły rezerwacji:</h3>
                    <ul>
                        <li>Data rozpoczęcia: {{start_date}} {{start_time}}</li>
                        <li>Data zakończenia: {{end_date}} {{end_time}}</li>
                        <li>Zarezerwowany sprzęt: {{equipment_list}}</li>
                        <li>Całkowity koszt: {{total_price}} zł</li>
                        <li>Wymagana kaucja: {{deposit_amount}} zł</li>
                    </ul>

                    <p class="important">Ważne informacje:</p>
                    <ul>
                        <li>Odbiór i zwrot sprzętu możliwy jest tylko w godzinach otwarcia wypożyczalni:
                            <ul>
                                <li>Poniedziałek - Piątek: 8:00 - 16:00</li>
                                <li>Sobota: 8:00 - 13:00</li>
                                <li>Niedziela: nieczynne</li>
                            </ul>
                        </li>
                        <li>Kaucja jest pobierana przed rozpoczęciem wypożyczenia</li>
                        <li>Prosimy o przygotowanie dokumentu tożsamości przy odbiorze sprzętu</li>
                    </ul>

                    <p>W razie pytań lub potrzeby zmiany rezerwacji, prosimy o kontakt:</p>
                    <ul>
                        <li>Telefon: 694 171 171</li>
                        <li>Email: biuro@solrent.pl</li>
                    </ul>
                </div>
                
                <div class="footer">
                    <p>SOLRENT - Wypożyczalnia sprzętu budowlanego i ogrodniczego</p>
                    <p>ul. Jęczmienna 4, 44-190 Knurów</p>
                </div>
            </div>
        </body>
        </html>'
    )
);